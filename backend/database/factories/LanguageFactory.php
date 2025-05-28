<?php

namespace Database\Factories;

use App\Models\Language;
use Illuminate\Database\Eloquent\Factories\Factory;

class LanguageFactory extends Factory
{
    protected $model = Language::class;

    public function definition(): array
    {
        // Using a more robust way to get unique language names for testing
        $languageNames = ['Swahili', 'Hindi', 'Bengali', 'Portuguese', 'Russian', 'Japanese', 'German', 'Korean', 'Turkish', 'Vietnamese', 'Italian', 'Polish', 'Ukrainian', 'Dutch', 'Thai', 'Greek', 'Czech', 'Swedish', 'Finnish', 'Norwegian', 'Danish', 'Hebrew'];
        return [
            'nom' => $this->faker->unique()->randomElement($languageNames),
        ];
    }
}
