<?php

namespace App\Filament\Resources\AboutUsCmsResource\Pages;

use App\Filament\Resources\AboutUsCmsResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateAboutUsCms extends CreateRecord
{
    protected static string $resource = AboutUsCmsResource::class;

    protected function getCreatedNotification(): ?\Filament\Notifications\Notification
    {
        // 这里可以自定义成功消息
        return \Filament\Notifications\Notification::make()
            ->success()
            ->title('About Us CMS Created')
            ->body('The About Us CMS has been successfully created.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
