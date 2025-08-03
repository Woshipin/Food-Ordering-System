<?php

namespace App\Filament\Resources\ContactFaqResource\Pages;

use App\Filament\Resources\ContactFaqResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditContactFaq extends EditRecord
{
    protected static string $resource = ContactFaqResource::class;

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
            ->title('Contact Faq Updated')
            ->body('The Contact Faq has been successfully updated.');
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index'); // 关键代码：创建成功后跳转到 ListTags
    }
}
