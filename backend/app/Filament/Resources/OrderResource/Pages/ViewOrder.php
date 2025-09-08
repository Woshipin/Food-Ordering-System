<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use Filament\Resources\Pages\ViewRecord;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Infolists\Infolist;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\Section as InfolistSection;
use Filament\Infolists\Components\Grid as InfolistGrid;
use Filament\Infolists\Components\ViewEntry;

class ViewOrder extends ViewRecord
{
    protected static string $resource = OrderResource::class;

    protected static string $view = 'filament.resources.order-resource.pages.view-order';

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->record($this->record)
            ->schema([
                InfolistGrid::make(4)->schema([
                    InfolistSection::make('Order Information')
                        ->schema([
                            TextEntry::make('order_number'),
                            TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                                'completed' => 'success',
                                'processing' => 'warning',
                                'pending' => 'primary',
                                'cancelled' => 'danger',
                                default => 'gray',
                            }),
                            TextEntry::make('created_at')->dateTime(),
                        ])->columnSpan(1),
                    
                    InfolistSection::make('Customer Information')
                        ->schema([
                            TextEntry::make('user.name'),
                            TextEntry::make('user.email'),
                        ])->columnSpan(1),

                    InfolistSection::make('Payment & Service')
                        ->schema([
                            TextEntry::make('payment_status')->badge()->color(fn (string $state): string => match ($state) {
                                'paid' => 'success',
                                'unpaid' => 'warning',
                                default => 'gray',
                            }),
                            TextEntry::make('payment_method'),
                            TextEntry::make('service_method'),
                        ])->columnSpan(1),
                    
                    InfolistSection::make('Service Details')
                    ->schema(function ($record) {
                        switch ($record->service_method) {
                            case 'delivery':
                                return [
                                    TextEntry::make('delivery_name')->label('Recipient Name'),
                                    TextEntry::make('delivery_phone')->label('Recipient Phone'),
                                    TextEntry::make('delivery_address')->label('Delivery Address'),
                                ];
                            case 'pickup':
                                return [
                                    TextEntry::make('pickup_time')->label('Pickup Time')->dateTime(),
                                ];
                            case 'dine_in':
                                return [
                                    TextEntry::make('table.table_number')->label('Table Number'),
                                    TextEntry::make('guests_count')->label('Number of Guests'),
                                    TextEntry::make('dining_date')->label('Dining Date')->date(),
                                    TextEntry::make('checkin_time')->label('Check-in Time'),
                                ];
                            default:
                                return [];
                        }
                    })->columnSpan(1),
                ]),

                InfolistGrid::make(1)->schema([
                    InfolistSection::make('Order Items')
                        ->schema([
                            ViewEntry::make('orderItems')->view('filament.infolists.components.order-items-list')
                        ]),
                ]),
                
                InfolistGrid::make(1)->schema([
                    InfolistSection::make('Pricing')
                        ->schema([
                            InfolistGrid::make(4)->schema([
                                TextEntry::make('subtotal')->money('myr'),
                                TextEntry::make('delivery_fee')->money('myr'),
                                TextEntry::make('discount_amount')->money('myr'),
                                TextEntry::make('total_amount')->money('myr')->weight('bold'),
                            ])
                        ])
                ])
            ]);
    }
}