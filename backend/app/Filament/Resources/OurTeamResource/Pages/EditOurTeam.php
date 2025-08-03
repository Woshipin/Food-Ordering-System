<?php

namespace App\Filament\Resources\OurTeamResource\Pages;

use App\Filament\Resources\OurTeamResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditOurTeam extends EditRecord
{
    protected static string $resource = OurTeamResource::class;

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
            ->title('Our Team Updated')
            ->body('The Our Team has been successfully updated.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
