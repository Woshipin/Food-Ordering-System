<?php

namespace App\Filament\Resources\MenuPackageResource\Pages;

use App\Filament\Resources\MenuPackageResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMenuPackage extends EditRecord
{
    protected static string $resource = MenuPackageResource::class;

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
            ->title('Menu Package Updated')
            ->body('The Menu Package has been successfully updated.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
