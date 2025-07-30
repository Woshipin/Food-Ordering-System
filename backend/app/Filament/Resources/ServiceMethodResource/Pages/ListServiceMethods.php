<?php

namespace App\Filament\Resources\ServiceMethodResource\Pages;

use App\Filament\Resources\ServiceMethodResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListServiceMethods extends ListRecords
{
    protected static string $resource = ServiceMethodResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
