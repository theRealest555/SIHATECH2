<?php

namespace Tests\Feature\Doctor;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Language;
use Laravel\Sanctum\Sanctum;

class DoctorControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $doctorUser;
    protected Doctor $doctor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->doctorUser = User::factory()->create(['role' => 'medecin', 'status' => 'actif', 'email_verified_at' => now()]);
        $this->doctor = Doctor::factory()->create([
            'user_id' => $this->doctorUser->id,
            'is_verified' => true, // Doctor needs to be verified for some actions
        ]);
        Sanctum::actingAs($this->doctorUser, ['role:medecin']);
    }

    public function test_doctor_can_update_their_spoken_languages()
    {
        $languages = Language::factory(3)->create();
        $languageIds = $languages->pluck('id')->toArray();

        $response = $this->putJson('/api/doctor/languages', [
            'language_ids' => $languageIds,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Languages updated successfully')
            ->assertJsonCount(3, 'data.languages');

        $this->doctor->refresh();
        $this->assertCount(3, $this->doctor->languages);
        foreach ($languageIds as $langId) {
            $this->assertContains($langId, $this->doctor->languages->pluck('id')->toArray());
        }
    }

    public function test_doctor_update_languages_requires_at_least_one_language()
    {
        $response = $this->putJson('/api/doctor/languages', [
            'language_ids' => [],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['language_ids']);
    }

    public function test_doctor_update_languages_fails_with_invalid_language_id()
    {
        $validLanguage = Language::factory()->create();
        $response = $this->putJson('/api/doctor/languages', [
            'language_ids' => [$validLanguage->id, 999], // 999 is an invalid ID
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['language_ids.1']);
    }

    public function test_patient_cannot_update_doctor_languages()
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        Sanctum::actingAs($patientUser, ['role:patient']);

        $languages = Language::factory(2)->create();
        $languageIds = $languages->pluck('id')->toArray();

        $response = $this->putJson('/api/doctor/languages', [
            'language_ids' => $languageIds,
        ]);

        $response->assertStatus(403); // Forbidden due to role middleware
    }
}
