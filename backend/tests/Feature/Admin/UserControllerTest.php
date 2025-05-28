<?php

namespace Tests\Feature\Admin;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Admin;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\AuditLog;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Hash;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $targetUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->adminUser = User::factory()->create(['role' => 'admin', 'status' => 'actif']);
        // Ensure the admin user has an admin profile and it's active
        if (!$this->adminUser->admin) {
            Admin::factory()->active()->create(['user_id' => $this->adminUser->id]);
        } else {
            $this->adminUser->admin->update(['admin_status' => 1]);
        }
        Sanctum::actingAs($this->adminUser, ['role:admin']);

        $this->targetUser = User::factory()->create(['role' => 'patient']);
        Patient::factory()->create(['user_id' => $this->targetUser->id]);
    }

    public function test_admin_can_list_users()
    {
        User::factory(5)->create();
        $response = $this->getJson('/api/admin/users'); //

        $response->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data' => [
                    '*' => ['id', 'nom', 'prenom', 'email', 'role', 'status']
                ],
                'total'
            ])
            ->assertJsonCount(User::where('role', '!=', 'admin')->where('id', '!=', $this->adminUser->id)->count() +1, 'data'); // +1 for targetUser, adminUser is also listed
            // The default query in UserController doesn't exclude the acting admin, adjust count if it should
    }

    public function test_admin_can_filter_users_by_role()
    {
        User::factory(2)->create(['role' => 'medecin']);
        $response = $this->getJson('/api/admin/users?role=medecin'); //

        $response->assertStatus(200);
        foreach ($response->json('data') as $user) {
            $this->assertEquals('medecin', $user['role']);
        }
    }

    public function test_admin_can_search_users()
    {
        $searchableUser = User::factory()->create(['nom' => 'SearchMe', 'role' => 'patient']);
        $response = $this->getJson('/api/admin/users?search=SearchMe'); //

        $response->assertStatus(200)
            ->assertJsonFragment(['nom' => 'SearchMe']);
    }


    public function test_admin_can_store_new_admin_user()
    {
        $adminData = [
            'nom' => 'NewAdmin',
            'prenom' => 'Test',
            'email' => 'newadmin@example.com',
            'password' => 'password123',
            'telephone' => '0600000000'
        ];

        $response = $this->postJson('/api/admin/users/admin', $adminData); //

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Admin user created successfully')
            ->assertJsonPath('user.email', 'newadmin@example.com')
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonPath('admin.admin_status', 1);

        $this->assertDatabaseHas('users', ['email' => 'newadmin@example.com', 'role' => 'admin']);
        $newUser = User::where('email', 'newadmin@example.com')->first();
        $this->assertDatabaseHas('admins', ['user_id' => $newUser->id, 'admin_status' => 1]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'created_admin', 'target_id' => $newUser->id]);
    }

    public function test_admin_can_update_user_status()
    {
        $response = $this->putJson('/api/admin/users/' . $this->targetUser->id . '/status', ['status' => 'inactif']); //

        $response->assertStatus(200)
            ->assertJsonPath('message', 'User status updated successfully')
            ->assertJsonPath('user.status', 'inactif');
        $this->assertDatabaseHas('users', ['id' => $this->targetUser->id, 'status' => 'inactif']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'updated_user_status', 'target_id' => $this->targetUser->id]);
    }

     public function test_admin_can_update_admin_user_status()
    {
        $otherAdminUser = User::factory()->create(['role' => 'admin']);
        $otherAdminProfile = Admin::factory()->create(['user_id' => $otherAdminUser->id, 'admin_status' => 1]);

        $response = $this->putJson("/api/admin/admins/{$otherAdminProfile->id}/status", ['admin_status' => 0]); //
        $response->assertStatus(200)
            ->assertJsonPath('message', 'Admin status updated successfully')
            ->assertJsonPath('admin.admin_status', 0);
        $this->assertDatabaseHas('admins', ['id' => $otherAdminProfile->id, 'admin_status' => 0]);
    }

    public function test_admin_can_show_user_details()
    {
        $doctorUser = User::factory()->create(['role' => 'medecin']);
        Doctor::factory()->create(['user_id' => $doctorUser->id]);

        $response = $this->getJson('/api/admin/users/' . $doctorUser->id); //
        $response->assertStatus(200)
            ->assertJsonPath('user.id', $doctorUser->id)
            ->assertJsonPath('doctor.user_id', $doctorUser->id);
    }


    public function test_admin_can_reset_user_password()
    {
        $newPassword = 'newPassword123';
        $response = $this->putJson('/api/admin/users/' . $this->targetUser->id . '/password', [ //
            'password' => $newPassword
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Password reset successfully');

        $this->targetUser->refresh();
        $this->assertTrue(Hash::check($newPassword, $this->targetUser->password));
        $this->assertDatabaseHas('audit_logs', ['action' => 'reset_user_password', 'target_id' => $this->targetUser->id]);
    }

    public function test_admin_can_delete_user()
    {
        $userToDelete = User::factory()->create();
        $response = $this->deleteJson('/api/admin/users/' . $userToDelete->id); //

        $response->assertStatus(200)
            ->assertJsonPath('message', 'User deleted successfully');
        $this->assertDatabaseMissing('users', ['id' => $userToDelete->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'deleted_user', 'target_id' => $userToDelete->id]);
    }

    public function test_non_active_admin_cannot_perform_actions()
    {
        // Deactivate the current admin
        $this->adminUser->admin->update(['admin_status' => 0]);
        Sanctum::actingAs($this->adminUser, ['role:admin']); // Re-authenticate with potentially cached/stale state if not careful

        $response = $this->getJson('/api/admin/users'); //
        $response->assertStatus(403)->assertJson(['message' => 'Unauthorized access']);
    }
}
