<?php

namespace App\Filament\Resources\AboutUsCmsResource\Pages;

use App\Filament\Resources\AboutUsCmsResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAboutUsCms extends ListRecords
{
    protected static string $resource = AboutUsCmsResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
