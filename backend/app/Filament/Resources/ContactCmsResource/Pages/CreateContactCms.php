<?php

namespace App\Filament\Resources\ContactCmsResource\Pages;

use App\Filament\Resources\ContactCmsResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateContactCms extends CreateRecord
{
    protected static string $resource = ContactCmsResource::class;

    protected function getCreatedNotification(): ?\Filament\Notifications\Notification
    {
        // 这里可以自定义成功消息
        return \Filament\Notifications\Notification::make()
            ->success()
            ->title('Contact CMS Created')
            ->body('The Contact CMS has been successfully created.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
