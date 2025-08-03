<?php

namespace App\Filament\Resources\OurTeamResource\Pages;

use App\Filament\Resources\OurTeamResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateOurTeam extends CreateRecord
{
    protected static string $resource = OurTeamResource::class;

    protected function getCreatedNotification(): ?\Filament\Notifications\Notification
    {
        // 这里可以自定义成功消息
        return \Filament\Notifications\Notification::make()
            ->success()
            ->title('Our Team Created')
            ->body('The Our Team has been successfully created.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }

}
