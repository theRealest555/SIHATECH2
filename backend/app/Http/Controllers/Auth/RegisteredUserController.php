<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Admin;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'nom' => ['required', 'string', 'max:50'],
                'prenom' => ['required', 'string', 'max:50'],
                'email' => ['required', 'string', 'email', 'max:50', 'unique:users'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
                'telephone' => ['nullable', 'string', 'max:20'],
                'role' => ['required', 'in:patient,medecin,admin'],
                'username' => ['nullable', 'string', 'max:50', 'unique:users'],
                'photo' => ['nullable', 'string', 'max:255'],
                'adresse' => ['nullable', 'string', 'max:255'],
                'sexe' => ['nullable', 'string', 'in:homme,femme'],
                'date_de_naissance' => ['nullable', 'date', 'before:today'],

                // Additional fields when doctor is selected
                'speciality_id' => ['required_if:role,medecin', 'exists:specialities,id'],
            ]);

            $user = User::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'telephone' => $request->telephone,
                'role' => $request->role,
                'status' => 'actif',
                'username' => $request->username,
                'photo' => $request->photo,
                'adresse' => $request->adresse,
                'sexe' => $request->sexe,
                'date_de_naissance' => $request->date_de_naissance,
            ]);

            // Create role-specific profile
            if ($request->role === 'patient') {
                Patient::create([
                    'user_id' => $user->id,
                ]);
            } elseif ($request->role === 'medecin') {
                Doctor::create([
                    'user_id' => $user->id,
                    'speciality_id' => $request->speciality_id,
                    'is_verified' => false,
                ]);
            } elseif ($request->role === 'admin') {
                Admin::create([
                    'user_id' => $user->id,
                    'admin_status' => 0, // Inactive by default
                ]);
            }

            // Trigger the Registered event which sends verification email
            event(new Registered($user));

            // Log the user in
            Auth::login($user);

            // Generate API token with role as ability
            $token = $user->createToken('auth-token', [$user->role])->plainTextToken;

            return response()->json([
                'message' => 'Registration successful. Please check your email to verify your account.',
                'user' => [
                    'id' => $user->id,
                    'nom' => $user->nom,
                    'prenom' => $user->prenom,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                    'email_verified_at' => $user->email_verified_at,
                    'photo' => $user->photo,
                    'telephone' => $user->telephone,
                ],
                'token' => $token
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->validator->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
