<?php

namespace App\Filament\Resources\AboutUsCmsResource\Pages;

use App\Filament\Resources\AboutUsCmsResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAboutUsCms extends EditRecord
{
    protected static string $resource = AboutUsCmsResource::class;

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
            ->title('About Us CMS Updated')
            ->body('The About Us CMS has been successfully updated.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
