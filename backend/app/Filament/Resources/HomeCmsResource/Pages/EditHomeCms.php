<?php

namespace App\Filament\Resources\HomeCmsResource\Pages;

use App\Filament\Resources\HomeCmsResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditHomeCms extends EditRecord
{
    protected static string $resource = HomeCmsResource::class;

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
            ->title('Home CMS Updated')
            ->body('The Home CMS has been successfully updated.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
