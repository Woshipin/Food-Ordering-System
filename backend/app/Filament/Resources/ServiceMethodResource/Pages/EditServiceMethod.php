<?php

namespace App\Filament\Resources\ServiceMethodResource\Pages;

use App\Filament\Resources\ServiceMethodResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditServiceMethod extends EditRecord
{
    protected static string $resource = ServiceMethodResource::class;

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
            ->title('cart Service Updated')
            ->body('The cart Service has been successfully updated.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
