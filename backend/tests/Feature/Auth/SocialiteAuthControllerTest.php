<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser; // Alias to avoid conflict
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Models\Patient; //

class SocialiteAuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_social_auth_redirects_to_provider()
    {
        Socialite::shouldReceive('driver->redirect')->andReturn(redirect('http://fake-google-auth.com'));

        $response = $this->get('/api/auth/social/google/redirect'); //
        $response->assertRedirect('http://fake-google-auth.com');
    }

    public function test_social_auth_redirect_fails_for_unsupported_provider()
    {
        $response = $this->get('/api/auth/social/unsupported/redirect'); //
        $response->assertRedirect('http://localhost:3000/login?error=unsupported_provider');
    }

    public function test_social_auth_callback_creates_new_user_and_redirects_with_token()
    {
        $socialUser = new SocialiteUser();
        $socialUser->id = '12345';
        $socialUser->name = 'Social User';
        $socialUser->email = 'social@example.com';
        $socialUser->avatar = 'http://example.com/avatar.jpg';

        Socialite::shouldReceive('driver->user')->andReturn($socialUser);

        $response = $this->get('/api/auth/social/google/callback'); //

        $this->assertDatabaseHas('users', [
            'email' => 'social@example.com',
            'provider' => 'google',
            'provider_id' => '12345',
        ]);
        $user = User::where('email', 'social@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNotNull($user->patient); //
        $this->assertTrue(Hash::check(Str::random(16), $user->password) == false); // Check a random password doesn't match

        $response->assertRedirect();
        $redirectUrl = $response->headers->get('Location');
        $this->assertStringContainsString('http://localhost:3000/auth/callback', $redirectUrl);
        $this->assertStringContainsString('token=', $redirectUrl);
        $this->assertStringContainsString('user=', $redirectUrl);
    }

    public function test_social_auth_callback_logs_in_existing_user()
    {
        $existingUser = User::factory()->create([
            'email' => 'existing.social@example.com',
            'provider' => null, // Simulate user registered normally first
            'provider_id' => null,
        ]);
        Patient::factory()->create(['user_id' => $existingUser->id]); //


        $socialUser = new SocialiteUser();
        $socialUser->id = '67890';
        $socialUser->name = $existingUser->prenom . ' ' . $existingUser->nom;
        $socialUser->email = $existingUser->email;
        $socialUser->avatar = 'http://example.com/avatar.jpg';

        Socialite::shouldReceive('driver->user')->andReturn($socialUser);

        $response = $this->get('/api/auth/social/facebook/callback'); //

        $this->assertDatabaseHas('users', [
            'email' => $existingUser->email,
            'provider' => 'facebook',
            'provider_id' => '67890',
        ]);

        $response->assertRedirect();
        $redirectUrl = $response->headers->get('Location');
        $this->assertStringContainsString('token=', $redirectUrl);
    }


    public function test_social_auth_callback_handles_socialite_exception()
    {
        Socialite::shouldReceive('driver->user')->andThrow(new \Exception('Socialite error'));

        $response = $this->get('/api/auth/social/google/callback'); //

        $response->assertRedirectContains('http://localhost:3000/login?error=authentication_failed');
    }
}
