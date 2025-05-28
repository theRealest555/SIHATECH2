<?php

namespace Tests\Feature\Admin;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Admin;
use App\Models\Payment;
use App\Models\Rendezvous;
use App\Models\Doctor;
use App\Models\Speciality;
use Laravel\Sanctum\Sanctum;
use Carbon\Carbon;

class ReportControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->adminUser = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        Admin::factory()->active()->create(['user_id' => $this->adminUser->id]);
        Sanctum::actingAs($this->adminUser, ['role:admin']);
    }

    public function test_admin_can_fetch_financial_stats()
    {
        Payment::factory()->count(5)->create(['status' => 'completed', 'amount' => 100, 'created_at' => now()]);
        Payment::factory()->count(2)->create(['status' => 'completed', 'amount' => 50, 'created_at' => now()->subMonths(2)]);

        $response = $this->getJson('/api/admin/reports/financial?start_date=' . now()->startOfMonth()->toDateString() . '&end_date=' . now()->endOfMonth()->toDateString());

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

    public function test_admin_can_fetch_rendezvous_stats()
    {
        $doctor = Doctor::factory()->create();
        Rendezvous::factory()->count(3)->create(['doctor_id' => $doctor->id, 'statut' => 'terminé', 'created_at' => now()]);
        Rendezvous::factory()->count(2)->create(['doctor_id' => $doctor->id, 'statut' => 'annulé', 'created_at' => now()]);

        $response = $this->getJson('/api/admin/reports/appointments?start_date=' . now()->startOfMonth()->toDateString() . '&end_date=' . now()->endOfMonth()->toDateString());

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

    public function test_admin_can_export_financial_report_as_csv()
    {
        // Ensure payments are created within the current month for the default date range
        Payment::factory()->count(2)->create([
            'status' => 'completed',
            'amount' => 150,
            'created_at' => now()->startOfMonth()->addDays(3) // Explicitly set created_at
        ]);

        $response = $this->get('/api/admin/reports/export/financial?format=csv');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8')
            ->assertHeader('Content-Disposition', 'attachment; filename="rapport_financier_' . now()->format('Y-m-d') . '.csv"');

        $content = $response->streamedContent();
        ob_start();
        echo $content;
        $csvOutput = ob_get_clean();

        if (strpos($csvOutput, "\xEF\xBB\xBF") === 0) {
            $csvOutput = substr($csvOutput, 3);
        }
        $csvOutput = trim($csvOutput);

        $lines = explode("\n", $csvOutput);
        $actualHeader = rtrim($lines[0], "\r");
        $expectedHeader = 'ID,"Nom du patient",Email,Montant,"Méthode de paiement",Statut,"Date de paiement",Abonnement';

        $this->assertEquals($expectedHeader, $actualHeader, "CSV header does not match.");
        // This assertion should now pass as payments with amount 150 are created for the current month
        $this->assertStringContainsString('150', $csvOutput);
    }

    public function test_admin_export_financial_report_handles_unsupported_format()
    {
        $response = $this->getJson('/api/admin/reports/export/financial?format=xlsx');
        $response->assertStatus(501)
                 ->assertJson(['message' => 'The requested export format is not supported. Please use CSV.']);
    }
}
