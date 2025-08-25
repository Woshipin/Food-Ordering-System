<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TimeSlotResource\Pages;
use App\Models\TimeSlot;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Illuminate\Validation\Rule;

class TimeSlotResource extends Resource
{
    protected static ?string $model = TimeSlot::class;

    protected static ?string $navigationIcon = 'heroicon-o-clock';
    protected static ?string $navigationLabel = 'Time Slots';
    protected static ?string $navigationGroup = 'Cart Management';

    // 指定在导航菜单分组中的排序位置
    protected static ?int $navigationSort = 18;

    // 定义一个方法，用于在导航菜单旁显示一个徽章（Badge），通常是记录总数
    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    // 定义导航徽章的颜色
    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Time Slot Details')
                    ->description('Define a booking time slot')
                    ->schema([
                        Forms\Components\TimePicker::make('start_time')
                            ->label('Start Time')
                            ->required()
                            ->seconds(false)
                            ->rules([
                                function ($get, $record) {
                                    return Rule::unique('time_slots', 'start_time')
                                        ->where('end_time', $get('end_time'))
                                        ->ignore($record?->id);
                                }
                            ]),

                        Forms\Components\TimePicker::make('end_time')
                            ->label('End Time')
                            ->required()
                            ->seconds(false)
                            ->after('start_time')
                            ->rules([
                                function ($get, $record) {
                                    return Rule::unique('time_slots', 'end_time')
                                        ->where('start_time', $get('start_time'))
                                        ->ignore($record?->id);
                                }
                            ]),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([

                TextColumn::make('id')
                    // 设置列的标题
                    ->label('ID')
                    // 允许在此列上进行排序
                    ->sortable()
                    // 设置此列可以被用户在界面上显示或隐藏
                    ->toggleable(),

                Tables\Columns\TextColumn::make('start_time')
                    ->label('Start Time')
                    ->dateTime('h:i A') // 12小时制，带 am/pm
                    ->sortable(),

                Tables\Columns\TextColumn::make('end_time')
                    ->label('End Time')
                    ->dateTime('h:i A') // 12小时制，带 am/pm
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created At')
                    ->dateTime('Y-m-d h:i A') // 12小时制
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTimeSlots::route('/'),
            'create' => Pages\CreateTimeSlot::route('/create'),
            'edit' => Pages\EditTimeSlot::route('/{record}/edit'),
        ];
    }
}
