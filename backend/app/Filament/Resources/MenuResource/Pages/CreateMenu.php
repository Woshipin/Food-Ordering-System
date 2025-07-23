<?php
namespace App\Filament\Resources\MenuResource\Pages;

use App\Filament\Resources\MenuResource;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;

class CreateMenu extends CreateRecord
{
    protected static string $resource = MenuResource::class;

    protected function afterCreate(): void
    {
        // 只同步 ID，不附加 price 字段
        $this->record->addons()->sync($this->data['addon_ids'] ?? []);
        $this->record->variants()->sync($this->data['variant_ids'] ?? []);
    }

    protected function getCreatedNotification(): ?Notification
    {
        return Notification::make()
            ->success()
            ->title('Menu Created')
            ->body('The menu has been successfully created.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
