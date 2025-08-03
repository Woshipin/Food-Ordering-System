<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactInfoResource\Pages;
use App\Filament\Resources\ContactInfoResource\RelationManagers;
use App\Models\ContactInfo;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ContactInfoResource extends Resource
{
    protected static ?string $model = ContactInfo::class;

    protected static ?string $navigationIcon = 'heroicon-o-identification';

    protected static ?string $navigationGroup = 'Contact Management System';

    protected static ?int $navigationSort = 6;

    // 定义一个方法，用于在导航菜单旁显示一个徽章（Badge），通常是记录总数
    public static function getNavigationBadge(): ?string
    {
        // 返回Category模型的总记录数作为徽章内容
        return static::getModel()::count();
    }

    // 定义导航徽章的颜色
    public static function getNavigationBadgeColor(): string|array|null
    {
        // 设置徽章颜色为'success'（绿色）
        return 'success';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Contact Information')
                    ->schema([
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\Select::make('type')
                                ->options([
                                    'phone' => 'Phone',
                                    'email' => 'Email',
                                    'address' => 'Address',
                                    'hours' => 'Hours',
                                ])->required(),
                            Forms\Components\TextInput::make('value')->required(),
                        ]),
                        Forms\Components\Grid::make(3)->schema([
                            Forms\Components\TextInput::make('label_en')->label('Label (EN)'),
                            Forms\Components\TextInput::make('label_zh')->label('Label (ZH)'),
                            Forms\Components\TextInput::make('label_ms')->label('Label (MS)'),
                        ]),
                        Forms\Components\Grid::make(3)->schema([
                            Forms\Components\TextInput::make('note_en')->label('Note (EN)'),
                            Forms\Components\TextInput::make('note_zh')->label('Note (ZH)'),
                            Forms\Components\TextInput::make('note_ms')->label('Note (MS)'),
                        ]),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\IconColumn::make('type')
                    ->icon(fn (string $state): string => match ($state) {
                        'phone' => 'heroicon-o-phone',
                        'email' => 'heroicon-o-envelope',
                        'address' => 'heroicon-o-map-pin',
                        'hours' => 'heroicon-o-clock',
                        default => 'heroicon-o-question-mark-circle',
                    })
                   ->color('warning'),
                Tables\Columns\TextColumn::make('value'),
                Tables\Columns\TextColumn::make('label_en'),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
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
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListContactInfos::route('/'),
            'create' => Pages\CreateContactInfo::route('/create'),
            'edit' => Pages\EditContactInfo::route('/{record}/edit'),
        ];
    }
}
