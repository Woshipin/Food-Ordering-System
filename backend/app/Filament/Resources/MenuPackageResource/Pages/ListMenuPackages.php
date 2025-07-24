<?php

namespace App\Filament\Resources\MenuPackageResource\Pages;

use App\Filament\Resources\MenuPackageResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListMenuPackages extends ListRecords
{
    protected static string $resource = MenuPackageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
