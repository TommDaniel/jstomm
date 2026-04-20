<?php

namespace App\Policies;

use App\Models\Radio;
use App\Models\User;

class RadioPolicy
{
    public function update(User $user, Radio $radio): bool
    {
        return $user->id === $radio->user_id;
    }

    public function delete(User $user, Radio $radio): bool
    {
        return $user->id === $radio->user_id;
    }
}
