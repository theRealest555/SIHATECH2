<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Doctor; //
use App\Models\User; //
use App\Models\Speciality; //
use App\Models\Language; //
use App\Models\Location; //
use App\Models\Leave; //
use App\Models\Rendezvous; //
use Carbon\Carbon;

class PublicDoctorControllerTest extends TestCase
{
    use RefreshDatabase;

    protected Doctor $doctor;
    protected Speciality $speciality;
    protected Location $location;

    protected function setUp(): void
    {
        parent::setUp();
        $this->speciality = Speciality::factory()->create(['nom' => 'Cardiology']); //
        $this->location = Location::factory()->create(['name' => 'Fes']); //

        $user = User::factory()->create(['role' => 'medecin']); //
        $this->doctor = Doctor::factory()->create([ //
            'user_id' => $user->id,
            'speciality_id' => $this->speciality->id,
            'location_id' => $this->location->id,
            'is_verified' => true,
            'is_active' => true,
            'horaires' => ['lundi' => ['09:00-12:00', '14:00-17:00']]
        ]);
    }

    public function test_can_list_all_verified_active_doctors()
    {
        Doctor::factory(2)->create(['is_verified' => true, 'is_active' => true]); //
        Doctor::factory()->create(['is_verified' => false]); //

        $response = $this->getJson('/api/public/doctors'); //

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data') // 1 from setUp + 2 created here
            ->assertJsonPath('data.0.is_verified', true)
            ->assertJsonPath('data.0.is_active', true);
    }

    public function test_can_search_doctors_by_speciality_location_and_name()
    {
        $language = Language::factory()->create(['nom' => 'French']); //
        $this->doctor->languages()->attach($language->id);

        $response = $this->getJson('/api/public/doctors/search?speciality_id=' . $this->speciality->id . '&location=' . $this->location->name . '&name=' . $this->doctor->user->prenom . '&language_ids[]=' . $language->id); //

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $this->doctor->id)
            ->assertJsonPath('data.0.speciality', $this->speciality->nom)
            ->assertJsonPath('data.0.location', $this->location->name)
            ->assertJsonPath('data.0.languages.0', 'French');
    }

    public function test_can_get_specific_doctor_details()
    {
        $response = $this->getJson('/api/public/doctors/' . $this->doctor->id); //

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $this->doctor->id)
            ->assertJsonPath('data.name', $this->doctor->full_name);
    }

    public function test_can_get_doctor_statistics()
    {
        // Create some appointments for the doctor
        Rendezvous::factory(5)->create(['doctor_id' => $this->doctor->id, 'statut' => 'terminé']); //

        $response = $this->getJson('/api/public/doctors/' . $this->doctor->id . '/statistics'); //

        $response->assertStatus(200)
            ->assertJsonPath('data.total_appointments', 5)
            ->assertJsonPath('data.completed_appointments', 5);
    }

    public function test_can_list_specialities()
    {
        Speciality::factory(3)->create(); //
        $response = $this->getJson('/api/public/specialities'); //
        $response->assertStatus(200)
            ->assertJsonCount(Speciality::count(), 'data'); //
    }

     public function test_can_list_languages()
    {
        Language::factory(3)->create(); //
        $response = $this->getJson('/api/public/languages'); //
        $response->assertStatus(200)
            ->assertJsonCount(Language::count(), 'data'); //
    }

    public function test_can_list_locations()
    {
        Location::factory()->create(['name' => 'Rabat']); //
        Location::factory()->create(['name' => 'Casablanca']); //
        // setUp creates 'Fes'

        $response = $this->getJson('/api/public/locations'); //
        $response->assertStatus(200)
            ->assertJsonCount(Location::distinct('name')->count('name'), 'data'); //
    }

    public function test_can_get_doctor_availability_including_schedule_and_leaves()
    {
        Leave::factory()->create([ //
            'doctor_id' => $this->doctor->id,
            'start_date' => Carbon::today()->addDay(),
            'end_date' => Carbon::today()->addDays(3)
        ]);

        $response = $this->getJson('/api/public/doctors/' . $this->doctor->id . '/availability'); //

        $response->assertStatus(200)
            ->assertJsonPath('data.schedule.lundi.0', '09:00-12:00')
            ->assertJsonCount(1, 'data.leaves');
    }

    public function test_can_get_available_slots_for_doctor_on_date()
    {
        $date = Carbon::today()->next('Monday')->format('Y-m-d'); // Assuming Monday is a working day as per setUp
        Rendezvous::factory()->create([ //
            'doctor_id' => $this->doctor->id,
            'date_heure' => Carbon::parse($date . ' 09:00:00'),
            'statut' => 'confirmé'
        ]);

        $response = $this->getJson('/api/public/doctors/' . $this->doctor->id . '/slots?date=' . $date); //

        $response->assertStatus(200)
            ->assertJsonStructure(['status', 'data', 'meta'])
            ->assertJsonFragment(['09:30']) // 09:00 is booked
            ->assertJsonMissing(['09:00']); // Ensure booked slot is not present
    }

    public function test_get_available_slots_returns_empty_if_doctor_on_leave()
    {
        $dateOnLeave = Carbon::today()->addDay()->format('Y-m-d');
        Leave::factory()->create([ //
            'doctor_id' => $this->doctor->id,
            'start_date' => $dateOnLeave,
            'end_date' => $dateOnLeave,
        ]);

        $response = $this->getJson('/api/public/doctors/' . $this->doctor->id . '/slots?date=' . $dateOnLeave); //

        $response->assertStatus(200)
            ->assertJsonPath('data', [])
            ->assertJsonPath('meta.is_on_leave', true);
    }
}
