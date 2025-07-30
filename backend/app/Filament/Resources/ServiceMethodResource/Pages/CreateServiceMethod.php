<?php

namespace App\Filament\Resources\ServiceMethodResource\Pages;

use App\Filament\Resources\ServiceMethodResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateServiceMethod extends CreateRecord
{
    protected static string $resource = ServiceMethodResource::class;

    protected function getCreatedNotification(): ?\Filament\Notifications\Notification
    {
        // 这里可以自定义成功消息
        return \Filament\Notifications\Notification::make()
            ->success()
            ->title('Cart Service Created')
            ->body('The Cart Service has been successfully created.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
