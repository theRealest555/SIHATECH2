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

        // Mock the service
        $this->statsServiceMock = Mockery::mock(DoctorStatisticsService::class);
        // Bind the mock to the service container.
        $this->app->bind(DoctorStatisticsService::class, function ($app, $params) {
            // This factory ensures our mock is returned when the controller resolves the service,
            // even with constructor parameters.
            return $this->statsServiceMock;
        });
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

        $response = $this->getJson('/api/doctor/stats');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.overview.total_patients', 10);
    }


    public function test_doctor_can_get_appointment_statistics_by_period()
    {
        $this->statsServiceMock->shouldReceive('getDashboardStats')->once()->andReturn([
             'appointments' => ['period' => 'week', 'data' => [], 'summary' => ['total' => 0]]
        ]);


        $response = $this->getJson('/api/doctor/stats/appointments?period=week');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data'
            ]);
    }


    public function test_doctor_can_export_statistics()
    {
        $this->statsServiceMock->shouldReceive('getDashboardStats')->once()->andReturn([
            'overview' => ['total_patients' => 5],
            'appointments' => ['total' => 10, 'by_status' => ['confirmé' => 8], 'rates' => ['completion_rate' => 80]],
            'patients' => ['total_unique' => 5],
            'revenue' => ['total_this_year' => 1000, 'monthly_breakdown' => []],
            'performance' => [],
            'trends' => [],
        ]);


        $response = $this->get('/api/doctor/stats/export?type=overview&format=csv');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }
}
