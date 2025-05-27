<?php

namespace Database\Seeders;

use App\Models\UserSubscription; // Changed from Abonnement to UserSubscription
use App\Models\Doctor;
use App\Models\Abonnement; // Import Abonnement for plan_id
use App\Models\User; // Import User for user_id
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // Import DB Facade

class AbonnementsTableSeeder extends Seeder
{
    public function run()
    {
        // Ensure necessary data exists
        if (User::count() === 0 || Doctor::count() === 0 || Abonnement::count() === 0) {
            $this->call([
                UserTableSeeder::class,
                SpecialitiesTableSeeder::class, // Assuming doctors depend on specialities
                DoctorsTableSeeder::class,
                SubscriptionPlansSeeder::class // Ensure subscription plans exist
            ]);
        }

        $patients = User::where('role', 'patient')->get();
        $doctors = Doctor::all(); // Doctors have user_id
        $abonnementsPlans = Abonnement::all(); // Actual subscription plans

        if ($patients->isEmpty() || $abonnementsPlans->isEmpty()) {
            $this->command->error('Please ensure UserTableSeeder, DoctorsTableSeeder, and SubscriptionPlansSeeder have been run!');
            return;
        }

        // Temporarily disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;'); // Add this line

        // Clear existing user subscriptions to avoid duplicates on re-seeding
        // Consider if you want to truncate or update based on specific unique keys
        DB::table('user_subscriptions')->truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;'); // Add this line


        // Example data for UserSubscription
        $userSubscriptionsData = [
            [
                'user_id' => $patients->first()->id, // Assuming the first patient has a subscription
                'subscription_plan_name' => 'Basic', // Use plan name to find the plan
                'starts_at' => Carbon::now()->subMonths(2),
                'ends_at' => Carbon::now()->subDays(1),
                'status' => 'expired',
                'cancelled_at' => null,
            ],
            [
                'user_id' => $patients->first()->id, // Same patient, new subscription
                'subscription_plan_name' => 'Premium',
                'starts_at' => Carbon::now()->subDays(5),
                'ends_at' => Carbon::now()->addMonths(1)->subDays(5),
                'status' => 'active',
                'cancelled_at' => null,
            ],
            [
                'user_id' => $doctors->first()->user_id, // Assuming the first doctor has a subscription
                'subscription_plan_name' => 'Premium Annuel',
                'starts_at' => Carbon::now()->subMonths(3),
                'ends_at' => Carbon::now()->addMonths(9),
                'status' => 'active',
                'cancelled_at' => null,
            ],
             [
                'user_id' => $doctors->get(1)->user_id ?? $doctors->first()->user_id, // Second doctor
                'subscription_plan_name' => 'Basic',
                'starts_at' => Carbon::now()->subWeek(),
                'ends_at' => Carbon::now()->addMonths(1)->subWeek(),
                'status' => 'active',
                'cancelled_at' => null,
            ]
        ];

        foreach ($userSubscriptionsData as $subscriptionData) {
            $plan = Abonnement::where('name', $subscriptionData['subscription_plan_name'])->first();
            $user = User::find($subscriptionData['user_id']);

            if ($plan && $user) {
                UserSubscription::create([
                    'user_id' => $user->id,
                    'subscription_plan_id' => $plan->id,
                    'status' => $subscriptionData['status'],
                    'starts_at' => $subscriptionData['starts_at'],
                    'ends_at' => $subscriptionData['ends_at'],
                    'cancelled_at' => $subscriptionData['cancelled_at'],
                    'payment_method' => ['type' => 'manual', 'details' => 'seeded data'] // Add dummy payment method
                ]);
            } else {
                $this->command->warn("Skipping subscription for user ID {$subscriptionData['user_id']} with plan '{$subscriptionData['subscription_plan_name']}' because plan or user not found.");
            }
        }
    }
}
