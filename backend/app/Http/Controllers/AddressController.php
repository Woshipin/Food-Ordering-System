<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AddressController extends Controller
{
    /**
     * A helper function to get the authenticated user from the JWT token.
     */
    private function getAuthenticatedUser()
    {
        try {
            if (!$user = JWTAuth::parseToken()->authenticate()) {
                return response()->json(['user_not_found'], 404);
            }
        } catch (JWTException $e) {
            return response()->json(['token_error' => $e->getMessage()], 500);
        }
        return $user;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = $this->getAuthenticatedUser();
        if (!$user instanceof \App\Models\User) {
            return $user; // It's an error response
        }

        $addresses = $user->addresses()->orderBy('is_default', 'desc')->get();
        return response()->json($addresses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $this->getAuthenticatedUser();
        if (!$user instanceof \App\Models\User) {
            return $user;
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'building' => 'nullable|string|max:255',
            'floor' => 'nullable|string|max:255',
            'is_default' => 'sometimes|boolean',
        ]);

        if ($request->input('is_default', false)) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create($validated);

        return response()->json($address, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Address $address)
    {
        $user = $this->getAuthenticatedUser();
        if (!$user instanceof \App\Models\User || $user->id !== $address->user_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($address);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Address $address)
    {
        $user = $this->getAuthenticatedUser();
        if (!$user instanceof \App\Models\User || $user->id !== $address->user_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'address' => 'sometimes|required|string|max:255',
            'building' => 'nullable|string|max:255',
            'floor' => 'nullable|string|max:255',
            'is_default' => 'sometimes|boolean',
        ]);

        if ($request->input('is_default', false)) {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json($address);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Address $address)
    {
        $user = $this->getAuthenticatedUser();
        if (!$user instanceof \App\Models\User || $user->id !== $address->user_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($address->is_default) {
            $newDefault = $user->addresses()->where('id', '!=', $address->id)->first();
            if ($newDefault) {
                $newDefault->update(['is_default' => true]);
            }
        }

        $address->delete();

        return response()->json(null, 204);
    }

    /**
     * Set the specified address as default.
     */
    public function setDefault(Address $address)
    {
        $user = $this->getAuthenticatedUser();
        if (!$user instanceof \App\Models\User || $user->id !== $address->user_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        DB::transaction(function () use ($user, $address) {
            $user->addresses()->update(['is_default' => false]);
            $address->update(['is_default' => true]);
        });

        return response()->json(['message' => 'Address set as default successfully.']);
    }
}
