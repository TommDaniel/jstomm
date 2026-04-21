<?php

namespace App\Policies;

use App\Models\Apartment;
use App\Models\User;

class ApartmentPolicy
{
    public function view(User $user, Apartment $apartment): bool
    {
        return $user->id === $apartment->user_id;
    }

    public function update(User $user, Apartment $apartment): bool
    {
        return $user->id === $apartment->user_id;
    }

    public function delete(User $user, Apartment $apartment): bool
    {
        return $user->id === $apartment->user_id;
    }
}
