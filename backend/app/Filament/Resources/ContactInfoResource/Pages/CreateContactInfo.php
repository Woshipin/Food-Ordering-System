<?php

namespace App\Filament\Resources\ContactInfoResource\Pages;

use App\Filament\Resources\ContactInfoResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateContactInfo extends CreateRecord
{
    protected static string $resource = ContactInfoResource::class;

    protected function getCreatedNotification(): ?\Filament\Notifications\Notification
    {
        // 这里可以自定义成功消息
        return \Filament\Notifications\Notification::make()
            ->success()
            ->title('Contact Info Created')
            ->body('The Contact Info has been successfully created.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
