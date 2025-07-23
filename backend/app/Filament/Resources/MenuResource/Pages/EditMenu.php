<?php
namespace App\Filament\Resources\MenuResource\Pages;

use App\Filament\Resources\MenuResource;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;

class EditMenu extends EditRecord
{
    protected static string $resource = MenuResource::class;

    protected function afterSave(): void
    {
        // 只同步 ID，不附加 price 字段
        $this->record->addons()->sync($this->data['addon_ids'] ?? []);
        $this->record->variants()->sync($this->data['variant_ids'] ?? []);
    }

    protected function getSavedNotification(): ?Notification
    {
        return Notification::make()
            ->success()
            ->title('Menu Updated')
            ->body('The menu has been successfully updated.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
