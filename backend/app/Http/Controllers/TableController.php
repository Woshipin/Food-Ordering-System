<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Table;

class TableController extends Controller
{
    public function index()
    {
        $tables = Table::where('is_available', true)->get();

        $formattedTables = $tables->map(function (Table $table) {
            return [
                'id' => $table->id,
                'name' => $table->name,
                'description' => $table->description,
                'capacity' => $table->capacity,
                'location' => $table->location,
                'status' => $table->is_available ? 'available' : 'unavailable',
            ];
        });
        return response()->json($formattedTables);
    }
}
