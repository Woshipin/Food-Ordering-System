<?php

namespace App\Filament\Resources\ContactMapResource\Pages;

use App\Filament\Resources\ContactMapResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditContactMap extends EditRecord
{
    protected static string $resource = ContactMapResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function getSavedNotification(): ?\Filament\Notifications\Notification
    {
        return \Filament\Notifications\Notification::make()
            ->success()
            ->title('Contact Map Updated')
            ->body('The Contact Map has been successfully updated.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
