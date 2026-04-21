<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\Radio;
use App\Models\Trip;
use App\Models\TripPoint;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Usuária principal: Jacinta
        $jacinta = User::firstOrCreate(
            ['email' => 'jstomm@hotmail.com.br'],
            [
                'name' => 'Jacinta Maria Jung Tomm',
                'password' => Hash::make('JA2903lu'),
                'role' => 'admin',
            ]
        );

        // --- VIAGENS ---

        // Hub central
        $hub = ['name' => 'Santo Angelo, RS', 'latitude' => -28.2994, 'longitude' => -54.2631, 'is_hub' => true];

        // Rota Rio Grande do Sul
        $tripRS = Trip::create([
            'name' => 'Rio Grande do Sul',
            'year' => null,
            'description' => 'Viagens pelo estado gaúcho',
            'total_km' => 1200,
            'category' => 'rs',
        ]);
        $pointsRS = [
            ['name' => 'Santo Angelo, RS', 'latitude' => -28.2994, 'longitude' => -54.2631, 'order' => 1, 'km_from_previous' => 0, 'is_hub' => true],
            ['name' => 'Santa Maria, RS', 'latitude' => -29.6842, 'longitude' => -53.8069, 'order' => 2, 'km_from_previous' => 180],
            ['name' => 'Pinhal, RS', 'latitude' => -29.3267, 'longitude' => -53.2091, 'order' => 3, 'km_from_previous' => 90],
            ['name' => 'Bagé, RS', 'latitude' => -31.3289, 'longitude' => -54.1069, 'order' => 4, 'km_from_previous' => 280],
            ['name' => 'Porto Alegre, RS', 'latitude' => -30.0346, 'longitude' => -51.2177, 'order' => 5, 'km_from_previous' => 250],
            ['name' => 'Serra Gaúcha (Bento Gonçalves)', 'latitude' => -29.1681, 'longitude' => -51.5178, 'order' => 6, 'km_from_previous' => 130],
            ['name' => 'Santo Angelo, RS', 'latitude' => -28.2994, 'longitude' => -54.2631, 'order' => 7, 'km_from_previous' => 270, 'is_hub' => true],
        ];
        foreach ($pointsRS as $point) {
            TripPoint::create(array_merge($point, ['trip_id' => $tripRS->id]));
        }

        // Rota Brasil
        $tripBrasil = Trip::create([
            'name' => 'Brasil',
            'year' => null,
            'description' => 'Viagens pelo Brasil — rotas inter-estaduais',
            'total_km' => 15000,
            'category' => 'brasil',
        ]);
        $pointsBrasil = [
            ['name' => 'Santo Angelo, RS', 'latitude' => -28.2994, 'longitude' => -54.2631, 'order' => 1, 'km_from_previous' => 0, 'is_hub' => true],
            ['name' => 'Curitiba, PR', 'latitude' => -25.4284, 'longitude' => -49.2733, 'order' => 2, 'km_from_previous' => 900, 'is_car_route' => true, 'description' => 'Viagem de carro ~900km'],
            ['name' => 'Florianópolis, SC', 'latitude' => -27.5954, 'longitude' => -48.5480, 'order' => 3, 'km_from_previous' => 300],
            ['name' => 'Rio do Sul, SC', 'latitude' => -27.2141, 'longitude' => -49.6431, 'order' => 4, 'km_from_previous' => 130],
            ['name' => 'Cascavel, PR', 'latitude' => -24.9578, 'longitude' => -53.4596, 'order' => 5, 'km_from_previous' => 350],
            ['name' => 'São Paulo, SP', 'latitude' => -23.5505, 'longitude' => -46.6333, 'order' => 6, 'km_from_previous' => 580],
            ['name' => 'Rio de Janeiro, RJ', 'latitude' => -22.9068, 'longitude' => -43.1729, 'order' => 7, 'km_from_previous' => 440],
            ['name' => 'Brasília, DF', 'latitude' => -15.7975, 'longitude' => -47.8919, 'order' => 8, 'km_from_previous' => 1150, 'description' => 'Capital Federal'],
            ['name' => 'Recife, PE', 'latitude' => -8.0476, 'longitude' => -34.8770, 'order' => 9, 'km_from_previous' => 2200],
            ['name' => 'Natal, RN', 'latitude' => -5.7945, 'longitude' => -35.2110, 'order' => 10, 'km_from_previous' => 290, 'description' => 'Praias do Nordeste'],
            ['name' => 'Brasília, DF', 'latitude' => -15.7975, 'longitude' => -47.8919, 'order' => 11, 'km_from_previous' => 2200],
            ['name' => 'Santo Angelo, RS', 'latitude' => -28.2994, 'longitude' => -54.2631, 'order' => 12, 'km_from_previous' => 2200, 'is_car_route' => true, 'is_hub' => true, 'description' => '2.200km de carro de Brasília até Santo Ângelo'],
        ];
        foreach ($pointsBrasil as $point) {
            TripPoint::create(array_merge($point, ['trip_id' => $tripBrasil->id]));
        }

        // Rota Internacional
        $tripInternacional = Trip::create([
            'name' => 'Internacional',
            'year' => null,
            'description' => 'Viagens internacionais — Europa, Oriente Médio, América do Sul',
            'total_km' => 50000,
            'category' => 'internacional',
        ]);
        $pointsInternacional = [
            ['name' => 'Santo Angelo, RS', 'latitude' => -28.2994, 'longitude' => -54.2631, 'order' => 1, 'km_from_previous' => 0, 'is_hub' => true],
            ['name' => 'Montevidéu, Uruguai', 'latitude' => -34.9011, 'longitude' => -56.1645, 'order' => 2, 'km_from_previous' => 800],
            ['name' => 'Buenos Aires, Argentina', 'latitude' => -34.6037, 'longitude' => -58.3816, 'order' => 3, 'km_from_previous' => 220],
            ['name' => 'Assunção, Paraguai', 'latitude' => -25.2637, 'longitude' => -57.5759, 'order' => 4, 'km_from_previous' => 1300],
            ['name' => 'Lisboa, Portugal', 'latitude' => 38.7223, 'longitude' => -9.1393, 'order' => 5, 'km_from_previous' => 10100],
            ['name' => 'Alemanha', 'latitude' => 50.9375, 'longitude' => 6.9603, 'order' => 6, 'km_from_previous' => 2400],
            ['name' => 'Amsterdam, Holanda', 'latitude' => 52.3676, 'longitude' => 4.9041, 'order' => 7, 'km_from_previous' => 230],
            ['name' => 'Bruxelas, Bélgica', 'latitude' => 50.8503, 'longitude' => 4.3517, 'order' => 8, 'km_from_previous' => 210],
            ['name' => 'Budapeste, Hungria', 'latitude' => 47.4979, 'longitude' => 19.0402, 'order' => 9, 'km_from_previous' => 1700],
            ['name' => 'Egito (Cairo/Gizé)', 'latitude' => 29.9792, 'longitude' => 31.1342, 'order' => 10, 'km_from_previous' => 2400],
            ['name' => 'Israel (Jerusalém)', 'latitude' => 31.7683, 'longitude' => 35.2137, 'order' => 11, 'km_from_previous' => 400],
            ['name' => 'Santo Angelo, RS', 'latitude' => -28.2994, 'longitude' => -54.2631, 'order' => 12, 'km_from_previous' => 11000, 'is_hub' => true],
        ];
        foreach ($pointsInternacional as $point) {
            TripPoint::create(array_merge($point, ['trip_id' => $tripInternacional->id]));
        }

        // --- RÁDIOS ---
        Radio::create(['user_id' => $jacinta->id, 'name' => 'Rádio Santo Ângelo', 'stream_url' => 'https://paineldj.com.br:20079/stream', 'genre' => 'Regional', 'is_favorite' => true, 'order' => 1]);
        Radio::create(['user_id' => $jacinta->id, 'name' => 'Rádio Sepé', 'stream_url' => 'https://jstomm.com/stream/sepe', 'genre' => 'Regional', 'is_favorite' => true, 'order' => 2]);
        Radio::create(['user_id' => $jacinta->id, 'name' => 'Ronda Gaúcha', 'stream_url' => 'https://jstomm.com/stream/ronda', 'genre' => 'Regional', 'is_favorite' => true, 'order' => 3]);

        // --- ÁLBUNS ---
        $albumFamilia = Album::create(['user_id' => $jacinta->id, 'name' => 'Família', 'type' => 'momento']);
        $albumViagens = Album::create(['user_id' => $jacinta->id, 'name' => 'Viagens', 'type' => 'viagem']);
        $albumAniversario = Album::create(['user_id' => $jacinta->id, 'name' => '70 Anos', 'type' => 'momento']);
    }
}
