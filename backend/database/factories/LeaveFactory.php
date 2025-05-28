<?php

namespace Database\Factories;

use App\Models\Leave;
use App\Models\Doctor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Leave>
 */
class LeaveFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Leave::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = Carbon::instance($this->faker->dateTimeBetween('+1 day', '+1 month'));
        $endDate = $startDate->copy()->addDays($this->faker->numberBetween(1, 7));

        return [
            'doctor_id' => Doctor::factory(), // Assumes DoctorFactory exists and creates a doctor
            'start_date' => $startDate,
            'end_date' => $endDate,
            'reason' => $this->faker->optional()->sentence, // Reason is nullable as per migration
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate a past leave.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function pastLeave(): Factory
    {
        return $this->state(function (array $attributes) {
            $endDate = Carbon::instance($this->faker->dateTimeBetween('-1 month', '-1 day'));
            $startDate = $endDate->copy()->subDays($this->faker->numberBetween(1, 7));
            return [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ];
        });
    }

    /**
     * Indicate an ongoing leave.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function ongoingLeave(): Factory
    {
        return $this->state(function (array $attributes) {
            $startDate = Carbon::instance($this->faker->dateTimeBetween('-3 days', 'now'));
            $endDate = $startDate->copy()->addDays($this->faker->numberBetween(3, 10)); // Ensure it's ongoing
            return [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ];
        });
    }
}
