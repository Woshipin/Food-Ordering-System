<?php

namespace App\Filament\Resources\ContactFaqResource\Pages;

use App\Filament\Resources\ContactFaqResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListContactFaqs extends ListRecords
{
    protected static string $resource = ContactFaqResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
