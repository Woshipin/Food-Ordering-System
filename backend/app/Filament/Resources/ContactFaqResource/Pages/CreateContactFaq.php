<?php

namespace App\Filament\Resources\ContactFaqResource\Pages;

use App\Filament\Resources\ContactFaqResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateContactFaq extends CreateRecord
{
    protected static string $resource = ContactFaqResource::class;

    protected function getCreatedNotification(): ?\Filament\Notifications\Notification
    {
        // 这里可以自定义成功消息
        return \Filament\Notifications\Notification::make()
            ->success()
            ->title('Contact Faq Created')
            ->body('The Contact Faq has been successfully created.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
