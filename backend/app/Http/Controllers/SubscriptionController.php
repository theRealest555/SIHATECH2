<?php

namespace App\Http\Controllers;

use App\Models\Abonnement;
use App\Models\UserSubscription;
use App\Models\Payment;
use App\Services\StripePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
// Remove direct Stripe SDK imports if all calls are through the service
// use Stripe\SetupIntent;
// use Stripe\PaymentMethod;

class SubscriptionController extends Controller
{
    protected $stripeService;

    public function __construct(StripePaymentService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Get available subscription plans
     */
    public function getPlans(): JsonResponse
    {
        $plans = Abonnement::where('is_active', true)->get()->map(function ($plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'price' => $plan->price,
                'billing_cycle' => $plan->billing_cycle,
                'features' => $plan->features,
                'stripe_price_id' => $plan->stripe_price_id ?? null,
                'popular' => $plan->name === 'Premium',
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $plans
        ]);
    }

    /**
     * Get Stripe setup intent for payment method collection
     */
    public function getSetupIntent(): JsonResponse
    {
        try {
            $user = Auth::user();
            $customer = $this->stripeService->getOrCreateCustomer($user);

            // Use the service to create the SetupIntent
            $setupIntent = $this->stripeService->createStripeSetupIntent($customer->id); // Assuming this method exists in your service

            return response()->json([
                'status' => 'success',
                'client_secret' => $setupIntent->client_secret,
                'customer_id' => $customer->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Setup intent creation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to initialize payment setup',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Subscribe to a plan
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:abonnements,id',
            'payment_method_id' => 'required|string',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $user = Auth::user();
                $plan = Abonnement::findOrFail($request->plan_id);

                $existingSubscription = UserSubscription::where('user_id', $user->id)
                    ->where('status', 'active')
                    ->first();

                if ($existingSubscription) {
                    $this->cancelExistingSubscription($existingSubscription);
                }

                $startsAt = now();
                $endsAt = $plan->billing_cycle === 'monthly'
                    ? $startsAt->copy()->addMonth()
                    : $startsAt->copy()->addYear();

                $subscription = UserSubscription::create([
                    'user_id' => $user->id,
                    'subscription_plan_id' => $plan->id,
                    'status' => 'pending',
                    'starts_at' => $startsAt,
                    'ends_at' => $endsAt,
                    'payment_method' => [
                        'type' => 'stripe',
                        'payment_method_id' => $request->payment_method_id,
                    ]
                ]);

                $paymentResult = $this->stripeService->processPayment([
                    'amount' => $plan->price,
                    'currency' => 'MAD',
                    'user_id' => $user->id,
                    'user' => $user,
                    'subscription_id' => $subscription->id,
                    'subscription_plan_id' => $plan->id,
                    'price_id' => $plan->stripe_price_id,
                    'payment_method_id' => $request->payment_method_id,
                    'description' => "Abonnement {$plan->name} pour {$user->prenom} {$user->nom}",
                ]);

                if ($paymentResult['success']) {
                    $subscription->update([
                        'status' => 'active',
                        'payment_method' => array_merge($subscription->payment_method, [
                            'stripe_subscription_id' => $paymentResult['subscription']->id ?? null,
                        ])
                    ]);
                    $subscription->load('subscriptionPlan');
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Abonnement créé avec succès',
                        'data' => [
                            'subscription' => $subscription,
                            'payment' => $paymentResult['payment'],
                            'client_secret' => $paymentResult['client_secret'] ?? null,
                        ]
                    ]);
                }

                $subscription->update(['status' => 'cancelled']);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Échec du paiement',
                    'error' => $paymentResult['error'] ?? 'Unknown payment error'
                ], 400);
            });
        } catch (\Exception $e) {
            Log::error('Subscription creation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel user subscription
     */
    public function cancelSubscription(): JsonResponse
    {
        try {
            $user = Auth::user();
            $subscription = UserSubscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            if (!$subscription) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Aucun abonnement actif trouvé'
                ], 404);
            }

            if (!empty($subscription->payment_method['stripe_subscription_id'])) {
                $result = $this->stripeService->cancelSubscription(
                    $subscription->payment_method['stripe_subscription_id']
                );
                if (!$result['success']) {
                    Log::error('Failed to cancel Stripe subscription', [
                        'subscription_id' => $subscription->id,
                        'error' => $result['error'] ?? 'Unknown Stripe cancellation error'
                    ]);
                    // Optionally, decide if this should prevent local cancellation
                }
            }

            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => now()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Abonnement annulé avec succès',
                'data' => [
                    'subscription' => $subscription,
                    'effective_until' => $subscription->ends_at->format('Y-m-d'),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Subscription cancellation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to cancel subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update payment method for subscription
     */
    public function updatePaymentMethod(Request $request): JsonResponse
    {
        $request->validate([
            'payment_method_id' => 'required|string',
        ]);

        try {
            $user = Auth::user();
            $subscription = UserSubscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            if (!$subscription) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No active subscription found'
                ], 404);
            }

            // Use the service to update payment method
            $result = $this->stripeService->updateSubscriptionPaymentMethod(
                $user,
                $subscription->payment_method['stripe_subscription_id'] ?? null, // Pass Stripe subscription ID if available
                $request->payment_method_id
            );

            if (!$result['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to update payment method with Stripe',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 500);
            }

            $subscription->update([
                'payment_method' => array_merge($subscription->payment_method, [
                    'payment_method_id' => $request->payment_method_id,
                    'updated_at' => now(),
                ])
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment method updated successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Payment method update failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update payment method',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function getUserSubscription(): JsonResponse
    {
        $user = Auth::user();
        $subscription = UserSubscription::with('subscriptionPlan')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (!$subscription) {
            return response()->json([
                'status' => 'success',
                'data' => null,
                'message' => 'No active subscription'
            ]);
        }

        $payments = Payment::where('user_subscription_id', $subscription->id)
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'subscription' => $subscription,
                'next_billing_date' => $subscription->ends_at->format('Y-m-d'),
                'days_remaining' => $subscription->getRemainingDays(),
                'is_expiring_soon' => $subscription->getRemainingDays() <= 7,
                'recent_payments' => $payments->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'amount' => $payment->amount,
                        'currency' => $payment->currency,
                        'date' => $payment->created_at->format('Y-m-d'),
                        'transaction_id' => $payment->transaction_id,
                    ];
                }),
            ]
        ]);
    }

    public function getSubscriptionHistory(): JsonResponse
    {
        $user = Auth::user();

        $subscriptions = UserSubscription::with('subscriptionPlan')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($subscription) {
                return [
                    'id' => $subscription->id,
                    'plan_name' => $subscription->subscriptionPlan->name ?? 'Unknown',
                    'status' => $subscription->status,
                    'starts_at' => $subscription->starts_at->format('Y-m-d'),
                    'ends_at' => $subscription->ends_at->format('Y-m-d'),
                    'cancelled_at' => $subscription->cancelled_at ? $subscription->cancelled_at->format('Y-m-d') : null,
                    'amount' => $subscription->subscriptionPlan->price ?? 0,
                    'billing_cycle' => $subscription->subscriptionPlan->billing_cycle ?? 'monthly',
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $subscriptions
        ]);
    }

    public function getPaymentHistory(): JsonResponse
    {
        $user = Auth::user();

        $payments = Payment::where('user_id', $user->id)
            ->with('userSubscription.subscriptionPlan')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $payments->getCollection()->transform(function ($payment) {
            return [
                'id' => $payment->id,
                'transaction_id' => $payment->transaction_id,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'status' => $payment->status,
                'payment_method' => $payment->payment_method,
                'date' => $payment->created_at->format('Y-m-d H:i:s'),
                'plan_name' => $payment->userSubscription && $payment->userSubscription->subscriptionPlan ? $payment->userSubscription->subscriptionPlan->name : 'One-time payment',
                'invoice_url' => $payment->payment_data['invoice_url'] ?? null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'from' => $payments->firstItem(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'to' => $payments->lastItem(),
                'total' => $payments->total(),
            ],
        ]);
    }

    protected function cancelExistingSubscription(UserSubscription $subscription): void
    {
        if (!empty($subscription->payment_method['stripe_subscription_id'])) {
            try {
                $this->stripeService->cancelSubscription(
                    $subscription->payment_method['stripe_subscription_id']
                );
            } catch (\Exception $e) {
                Log::error('Failed to cancel existing Stripe subscription: ' . $e->getMessage());
            }
        }
        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
    }

}
