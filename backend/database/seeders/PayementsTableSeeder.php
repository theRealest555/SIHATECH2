<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment; // Corrected model name from Payement to Payment
use App\Models\User; // Import User model
use App\Models\UserSubscription; // Import UserSubscription model
use Carbon\Carbon;

class PayementsTableSeeder extends Seeder
{
    public function run()
    {
        // Ensure User and UserSubscription data exists
        if (User::count() === 0 || UserSubscription::count() === 0) {
            $this->call([
                UserTableSeeder::class,
                SubscriptionPlansSeeder::class, // Ensure plans are seeded first
                // AbonnementsTableSeeder is renamed to UserSubscriptionSeeder conceptually,
                // and should be run to create UserSubscription records.
                // Assuming UserTableSeeder and SubscriptionPlansSeeder are sufficient to
                // set up users and plans for UserSubscription creation.
                // For direct seeding of UserSubscriptions, if not handled by AbonnementsTableSeeder,
                // you might need a dedicated UserSubscriptionSeeder.
            ]);
        }

        $usersWithSubscriptions = User::whereHas('userSubscriptions')->get();

        if ($usersWithSubscriptions->isEmpty()) {
            $this->command->warn('No users with subscriptions found to seed payments.');
            return;
        }

        // Clear existing payments to avoid duplicates on re-seeding
        Payment::truncate();

        foreach ($usersWithSubscriptions as $user) {
            $userSubscription = $user->userSubscriptions->first(); // Get the first subscription for the user

            if ($userSubscription) {
                Payment::create([
                    'user_id' => $user->id,
                    'user_subscription_id' => $userSubscription->id, // Use user_subscription_id
                    'transaction_id' => 'TXN-' . Carbon::now()->format('YmdHis') . '-' . uniqid(),
                    'amount' => $userSubscription->subscriptionPlan->price ?? 100.00, // Use price from linked plan
                    'currency' => 'MAD',
                    'status' => 'completed',
                    'payment_method' => 'stripe', // Use 'stripe' or other defined methods
                    'payment_data' => ['description' => 'Seeded payment for subscription']
                ]);
            }
        }
    }
}
