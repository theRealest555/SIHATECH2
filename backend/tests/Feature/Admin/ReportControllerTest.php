<?php

namespace Tests\Feature\Admin;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Admin;
use App\Models\Avis;
use App\Models\Rendezvous;
use App\Models\Payment;
use App\Models\Doctor;
use App\Models\Patient; // Added Patient
use App\Models\Speciality;
use Laravel\Sanctum\Sanctum;
use Carbon\Carbon; // Added Carbon

class ReportControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->adminUser = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        // Ensure the admin user has an admin profile and it's active
        if (!$this->adminUser->admin()->exists()) {
            Admin::factory()->active()->create(['user_id' => $this->adminUser->id]);
        } else {
            $this->adminUser->admin->update(['admin_status' => 1]);
        }
        $this->adminUser->refresh();
        Sanctum::actingAs($this->adminUser, ['role:admin']);
    }

    public function test_admin_can_fetch_financial_stats(): void
    {
        // Ensure payments are created within the current month
        Payment::factory()->count(5)->create([
            'status' => 'completed',
            'amount' => 100,
            'created_at' => Carbon::now()->startOfMonth()->addDays(2) // Explicitly set created_at
        ]);
        Payment::factory()->count(2)->create([
            'status' => 'completed',
            'amount' => 50,
            'created_at' => Carbon::now()->subMonths(2)
        ]);

        $startDate = Carbon::now()->startOfMonth()->toDateString();
        $endDate = Carbon::now()->endOfMonth()->toDateString();

        $response = $this->getJson("/api/admin/reports/financial?start_date={$startDate}&end_date={$endDate}");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [
                'total_revenue',
                'subscription_revenue',
                'active_subscriptions',
                'new_subscriptions',
                'cancelled_subscriptions',
                'payment_methods'
            ]])
            ->assertJsonPath('data.total_revenue', 5 * 100); // 500
    }

    public function test_admin_can_fetch_rendezvous_stats(): void
    {
        $doctorUser = User::factory()->create(['role' => 'medecin']); // Create a user for the doctor
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]); // Create doctor linked to user

        $patientUser = User::factory()->create(['role' => 'patient']); // Create a user for the patient
        Patient::factory()->create(['user_id' => $patientUser->id]); // Create patient linked to user


        Rendezvous::factory()->count(3)->create([
            'doctor_id' => $doctor->id,
            'patient_id' => $patientUser->patient->id, // Use the patient's profile ID
            'statut' => 'terminé',
            'created_at' => Carbon::now()->startOfMonth()->addDays(1) // Explicitly set created_at
        ]);
        Rendezvous::factory()->count(2)->create([
            'doctor_id' => $doctor->id,
            'patient_id' => $patientUser->patient->id, // Use the patient's profile ID
            'statut' => 'annulé',
            'created_at' => Carbon::now()->startOfMonth()->addDays(2) // Explicitly set created_at
        ]);

        $startDate = Carbon::now()->startOfMonth()->toDateString();
        $endDate = Carbon::now()->endOfMonth()->toDateString();

        $response = $this->getJson("/api/admin/reports/appointments?start_date={$startDate}&end_date={$endDate}");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [
                'total_rendezvouss',
                'confirmed_rendezvouss',
                'cancelled_rendezvouss',
                'completion_rate',
                'popular_specialties',
                'peak_hours'
            ]])
            ->assertJsonPath('data.total_rendezvouss', 5)
            ->assertJsonPath('data.cancelled_rendezvouss', 2);
    }

    public function test_admin_can_export_financial_report_as_csv(): void
    {
        Payment::factory()->count(2)->create([
            'status' => 'completed',
            'amount' => 150,
            'created_at' => Carbon::now()->startOfMonth()->addDays(3)
        ]);

        $startDate = Carbon::now()->startOfMonth()->toDateString();
        $endDate = Carbon::now()->endOfMonth()->toDateString();


        $response = $this->get("/api/admin/reports/export/financial?format=csv&start_date={$startDate}&end_date={$endDate}");

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8')
            ->assertHeader('Content-Disposition', 'attachment; filename="rapport_financier_' . now()->format('Y-m-d') . '.csv"');

        $content = $response->streamedContent();
        ob_start();
        echo $content; // Changed from $content()
        $csvOutput = ob_get_clean();

        if (strpos($csvOutput, "\xEF\xBB\xBF") === 0) {
            $csvOutput = substr($csvOutput, 3);
        }
        $csvOutput = trim($csvOutput);

        $lines = explode("\n", $csvOutput);
        $actualHeader = rtrim($lines[0], "\r"); // Remove potential trailing CR
        // Make sure the expected header exactly matches what FinancialReportExport generates
        $expectedHeader = 'ID,"Nom du patient",Email,Montant,"Méthode de paiement",Statut,"Date de paiement",Abonnement';

        $this->assertEquals($expectedHeader, $actualHeader, "CSV header does not match.");
        $this->assertStringContainsString('150', $csvOutput);
    }

    public function test_admin_export_financial_report_handles_unsupported_format(): void
    {
        $response = $this->getJson('/api/admin/reports/export/financial?format=xlsx');
        $response->assertStatus(501)
                 ->assertJson(['message' => 'The requested export format is not supported. Please use CSV.']);
    }
}
