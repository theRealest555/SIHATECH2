<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiFallbackRouteTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a non-existent API route returns the custom JSON 404 fallback response.
     *
     * @return void
     */
    public function test_non_existent_api_route_returns_json_404_with_fallback_message()
    {
        // Act: Make a GET request to a deliberately non-existent API endpoint
        $response = $this->getJson('/api/this-route-does-not-exist-for-testing');

        // Assert: Check for 404 status and the specific JSON structure of the fallback
        $response->assertStatus(404)
            ->assertJson([
                'status' => 'error',
                'message' => 'API endpoint not found',
            ])
            ->assertJsonStructure([
                'status',
                'message',
                'available_endpoints', // This key is part of your defined fallback response
            ]);
    }
}
