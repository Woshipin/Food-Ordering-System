<?php

namespace App\Filament\Resources\HomeCmsResource\Pages;

use App\Filament\Resources\HomeCmsResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateHomeCms extends CreateRecord
{
    protected static string $resource = HomeCmsResource::class;

    protected function getCreatedNotification(): ?\Filament\Notifications\Notification
    {
        // 这里可以自定义成功消息
        return \Filament\Notifications\Notification::make()
            ->success()
            ->title('Home CMS Created')
            ->body('The Home CMS has been successfully created.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
