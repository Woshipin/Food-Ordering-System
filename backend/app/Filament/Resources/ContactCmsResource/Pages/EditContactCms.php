<?php

namespace App\Filament\Resources\ContactCmsResource\Pages;

use App\Filament\Resources\ContactCmsResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditContactCms extends EditRecord
{
    protected static string $resource = ContactCmsResource::class;

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
            ->title('Contact CMS Updated')
            ->body('The Contact CMS has been successfully updated.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
