<?php

namespace App\Filament\Resources\ContactMapResource\Pages;

use App\Filament\Resources\ContactMapResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateContactMap extends CreateRecord
{
    protected static string $resource = ContactMapResource::class;

    protected function getCreatedNotification(): ?\Filament\Notifications\Notification
    {
        // 这里可以自定义成功消息
        return \Filament\Notifications\Notification::make()
            ->success()
            ->title('Contact Map Created')
            ->body('The Contact Map has been successfully created.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('edit', ['record' => $this->getRecord()]);
    }
}
