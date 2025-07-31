<?php

namespace App\Filament\Resources\ContactCmsResource\Pages;

use App\Filament\Resources\ContactCmsResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListContactCms extends ListRecords
{
    protected static string $resource = ContactCmsResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
