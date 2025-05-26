<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Notifications\PaymentSuccessNotification;
use App\Services\StripePaymentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function handle(StripePaymentService $stripeService): void
    {
        try {
            if ($this->payment->status === 'completed' || $this->payment->status === 'failed') {
                return;
            }

            $this->payment->update(['status' => 'completed']);

            if ($this->payment->user) {
                $this->payment->user->notify(new PaymentSuccessNotification($this->payment));
            }

            if ($this->payment->user_subscription_id && $this->payment->userSubscription) {
                $this->payment->userSubscription->update(['status' => 'active']);
            }

        } catch (\Exception $e) {
            $this->payment->update([
                'status' => 'failed',
                'payment_data' => array_merge($this->payment->payment_data ?? [], [
                    'error' => $e->getMessage(),
                    'failed_at' => now()->toISOString(),
                ])
            ]);

            if ($this->attempts() < 3) {
                $this->release(60);
            }
        }
    }

    public function failed(\Throwable $exception): void
    {
        $this->payment->update([
            'status' => 'failed',
            'payment_data' => array_merge($this->payment->payment_data ?? [], [
                'final_error' => $exception->getMessage(),
                'permanently_failed_at' => now()->toISOString(),
            ])
        ]);
    }
}
