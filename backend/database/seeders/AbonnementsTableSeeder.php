<?php

namespace Database\Seeders;

use App\Models\UserSubscription;
use App\Models\Doctor;
use App\Models\Abonnement;
use App\Models\User;
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
                SpecialitiesTableSeeder::class,
                DoctorsTableSeeder::class,
                SubscriptionPlansSeeder::class
            ]);
        }

        $patients = User::where('role', 'patient')->get();
        $doctors = Doctor::all();
        $abonnementsPlans = Abonnement::all();

        if ($patients->isEmpty() || $abonnementsPlans->isEmpty()) {
            $this->command->error('Please ensure UserTableSeeder, DoctorsTableSeeder, and SubscriptionPlansSeeder have been run!');
            return;
        }

        // Temporarily disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;'); // Add this line

        // Clear existing user subscriptions
        DB::table('user_subscriptions')->truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;'); // Add this line


        // Example data for UserSubscription
        $userSubscriptionsData = [
            [
                'user_id' => $patients->first()->id,
                'subscription_plan_name' => 'Basic',
                'starts_at' => Carbon::now()->subMonths(2),
                'ends_at' => Carbon::now()->subDays(1),
                'status' => 'expired',
                'cancelled_at' => null,
            ],
            [
                'user_id' => $patients->first()->id,
                'subscription_plan_name' => 'Premium',
                'starts_at' => Carbon::now()->subDays(5),
                'ends_at' => Carbon::now()->addMonths(1)->subDays(5),
                'status' => 'active',
                'cancelled_at' => null,
            ],
            [
                'user_id' => $doctors->first()->user_id,
                'subscription_plan_name' => 'Premium Annuel',
                'starts_at' => Carbon::now()->subMonths(3),
                'ends_at' => Carbon::now()->addMonths(9),
                'status' => 'active',
                'cancelled_at' => null,
            ],
             [
                'user_id' => $doctors->get(1)->user_id ?? $doctors->first()->user_id,
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
                    'payment_method' => ['type' => 'manual', 'details' => 'seeded data']
                ]);
            } else {
                $this->command->warn("Skipping subscription for user ID {$subscriptionData['user_id']} with plan '{$subscriptionData['subscription_plan_name']}' because plan or user not found.");
            }
        }
    }
}
