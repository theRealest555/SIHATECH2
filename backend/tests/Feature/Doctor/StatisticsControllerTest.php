<?php

namespace Tests\Feature\Doctor;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Rendezvous;
use App\Models\Payment;
use App\Services\DoctorStatisticsService; //
use Laravel\Sanctum\Sanctum;
use Mockery;

class StatisticsControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $doctorUser;
    protected Doctor $doctor;
    protected Mockery\MockInterface $statsServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->doctorUser = User::factory()->create(['role' => 'medecin', 'email_verified_at' => now(), 'status' => 'actif']);
        $this->doctor = Doctor::factory()->create(['user_id' => $this->doctorUser->id]);
        Sanctum::actingAs($this->doctorUser, ['role:medecin']);

        // Mock the service (optional, but good for isolating controller logic)
        $this->statsServiceMock = Mockery::mock(DoctorStatisticsService::class);
        $this->app->instance(DoctorStatisticsService::class, $this->statsServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_doctor_can_get_dashboard_statistics()
    {
        $mockStats = [
            'overview' => ['total_patients' => 10, 'appointments_today' => 2],
            'appointments' => ['total' => 50, 'by_status' => ['completed' => 40]],
            'patients' => ['total_unique' => 10, 'new_this_month' => 3],
            'revenue' => ['total_this_year' => 5000],
            'performance' => ['consultations_last_30_days' => 30],
            'trends' => ['appointments' => [['month' => 'Jan 2023', 'count' => 5]]]
        ];
        $this->statsServiceMock->shouldReceive('getDashboardStats')->once()->andReturn($mockStats);

        // Re-bind with the actual service for this specific test if you want to test the service too,
        // or ensure your mock provides what the controller expects.
        // For controller unit test, mocking is preferred. For integration, let the actual service run.
        // For this example, we test with the mock.

        $response = $this->getJson('/api/doctor/stats'); //

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.overview.total_patients', 10);
    }


    public function test_doctor_can_get_appointment_statistics_by_period()
    {
        // This test would ideally not mock DoctorStatisticsService to test the controller's
        // logic for calling the service with period parameters.
        // However, the controller currently does not pass these params to the service method directly.
        // It calls getDashboardStats().
        // The `appointments` method in StatisticsController needs to be implemented to use these params
        // or the test needs to be adapted to how it's currently implemented.

        // For now, assuming the appointments method is implemented to handle periods:
        Rendezvous::factory(5)->create(['doctor_id' => $this->doctor->id, 'date_heure' => now()->startOfWeek()->addDay()]);
        Rendezvous::factory(3)->create(['doctor_id' => $this->doctor->id, 'date_heure' => now()->subWeek()]);


        // If we want to test the actual service logic, we'd do:
        // $this->app->instance(DoctorStatisticsService::class, new DoctorStatisticsService($this->doctor));

        $response = $this->getJson('/api/doctor/stats/appointments?period=week'); //

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            // ->assertJsonPath('data.summary.total', 5) // Adjust based on actual logic
            ->assertJsonStructure([
                'status',
                'data' => ['period', 'data', 'summary']
            ]);
    }


    public function test_doctor_can_export_statistics()
    {
        $this->statsServiceMock->shouldReceive('getDashboardStats')->once()->andReturn([
            'overview' => ['total_patients' => 5],
            'appointments' => ['total' => 10, 'by_status' => ['confirmed' => 8], 'rates' => ['completion_rate' => 80]],
            'patients' => ['total_unique' => 5],
            'revenue' => ['total_this_year' => 1000, 'monthly_breakdown' => []],
            'performance' => [],
            'trends' => [],
        ]);


        $response = $this->get('/api/doctor/stats/export?type=overview&format=csv'); //

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        // Further assertions on CSV content can be done by inspecting $response->streamedContent()
    }
}
