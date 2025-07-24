<?php

namespace App\Filament\Resources\MenuPackageResource\Pages;

use App\Filament\Resources\MenuPackageResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateMenuPackage extends CreateRecord
{
    protected static string $resource = MenuPackageResource::class;

    protected function getCreatedNotification(): ?\Filament\Notifications\Notification
    {
        // 这里可以自定义成功消息
        return \Filament\Notifications\Notification::make()
            ->success()
            ->title('Menu Package Created')
            ->body('The Menu Package has been successfully created.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
