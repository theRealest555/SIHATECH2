<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Speciality;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Registered;
use App\Notifications\VerifyEmailNotification; // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/app/Notifications/VerifyEmailNotification.php]
use Illuminate\Support\Facades\Notification;

class ApiRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        parent::tearDown();
    }

    public function test_new_patient_can_register(): void
    {
        Notification::fake(); // Fake notifications to prevent actual email sending

        $userData = [
            'nom' => 'Test',
            'prenom' => 'Patient',
            'email' => 'patient@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'telephone' => '0611223344',
            'role' => 'patient',
        ];

        $response = $this->postJson('/api/register', $userData); // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/routes/api.php]

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'nom', 'prenom', 'email', 'role', 'status', 'email_verified_at'],
                'token',
            ])
            ->assertJsonPath('user.nom', 'Test') // MODIFIED LINE
            ->assertJsonPath('user.prenom', 'Patient') // MODIFIED LINE
            ->assertJsonPath('user.email', 'patient@example.com') // MODIFIED LINE
            ->assertJsonPath('user.status', 'actif') // MODIFIED LINE
            ->assertJsonPath('user.email_verified_at', null) // MODIFIED LINE
            ->assertJsonPath('user.role', 'patient'); // MODIFIED LINE

        $this->assertDatabaseHas('users', [
            'email' => 'patient@example.com',
            'role' => 'patient',
        ]);
        $this->assertDatabaseHas('patients', [ // Check if patient profile was created
            'user_id' => $response->json('user.id'),
        ]);

        $user = User::where('email', 'patient@example.com')->first();
        $this->assertNotNull($user);
        Notification::assertSentTo($user, VerifyEmailNotification::class); // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/app/Notifications/VerifyEmailNotification.php]
        $this->assertAuthenticatedAs($user, 'sanctum');
    }

    public function test_new_doctor_can_register_with_speciality(): void
    {
        Notification::fake();
        $speciality = Speciality::factory()->create();

        $doctorData = [
            'nom' => 'Test',
            'prenom' => 'Doctor',
            'email' => 'doctor@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'telephone' => '0655667788',
            'role' => 'medecin',
            'speciality_id' => $speciality->id,
        ];

        $response = $this->postJson('/api/register', $doctorData); // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/routes/api.php]

        $response->assertStatus(201)
                 ->assertJsonPath('user.role', 'medecin');

        $this->assertDatabaseHas('users', [
            'email' => 'doctor@example.com',
            'role' => 'medecin',
        ]);
        $this->assertDatabaseHas('doctors', [
            'user_id' => $response->json('user.id'),
            'speciality_id' => $speciality->id,
            'is_verified' => false, // Doctors are not verified by default
        ]);

        $user = User::where('email', 'doctor@example.com')->first();
        $this->assertNotNull($user);
        Notification::assertSentTo($user, VerifyEmailNotification::class); // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/app/Notifications/VerifyEmailNotification.php]
    }

    public function test_doctor_registration_fails_without_speciality_id(): void
    {
        $doctorData = [
            'nom' => 'Test',
            'prenom' => 'Doctor',
            'email' => 'doctor.nospec@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'medecin',
        ];

        $response = $this->postJson('/api/register', $doctorData); // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/routes/api.php]

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['speciality_id']);
    }

    public function test_registration_fails_with_existing_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $userData = [
            'nom' => 'Another',
            'prenom' => 'User',
            'email' => 'existing@example.com', // Email already taken
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'patient',
        ];

        $response = $this->postJson('/api/register', $userData); // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/routes/api.php]

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_requires_all_mandatory_fields(): void
    {
        $response = $this->postJson('/api/register', []); // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/routes/api.php]

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['nom', 'prenom', 'email', 'password', 'role']);
    }

    public function test_registration_password_must_be_confirmed(): void
    {
        $userData = [
            'nom' => 'Test',
            'prenom' => 'User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'differentPassword', // Mismatch
            'role' => 'patient',
        ];

        $response = $this->postJson('/api/register', $userData); // [cite: therealest555/sihatech2/SIHATECH2-bfec2d9e1e08e8149fc892e74235c175d08bed7c/backend/routes/api.php]

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }
}
