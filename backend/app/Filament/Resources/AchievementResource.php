<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AchievementResource\Pages;
use App\Models\Achievement;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\Section;
use Filament\Tables\Columns\ImageColumn;

class AchievementResource extends Resource
{
    protected static ?string $model = Achievement::class;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    protected static ?string $navigationGroup = 'About Us CMS Management';

    protected static ?string $label = 'Achievement';

    protected static ?int $navigationSort = 2;

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // [优化] 添加一个大的外层Section，将所有表单项包裹起来
                Section::make('Achievement Details')
                    ->description('Fill in all the details for the achievement.')
                    ->schema([
                        Forms\Components\Select::make('icon')
                            ->label('Icon')
                            ->options([
                                '🏆' => '🏆 Trophy',
                                '⭐' => '⭐ Star',
                                '🥇' => '🥇 1st Place Medal',
                                '🚀' => '🚀 Rocket',
                            ])
                            ->required(),

                        Forms\Components\TextInput::make('value')
                            ->label('Value')
                            ->required(),

                        // [保留] 内层的 "小Section" 用于组织多语言标签
                        Section::make('Labels')
                            ->description('Enter the labels for each language.')
                            ->schema([
                                Forms\Components\TextInput::make('label_en')
                                    ->label('Label (EN)')
                                    ->required(),
                                Forms\Components\TextInput::make('label_zh')
                                    ->label('Label (ZH)')
                                    ->required(),
                                Forms\Components\TextInput::make('label_ms')
                                    ->label('Label (MS)')
                                    ->required(),
                            ])
                            ->columns(3), // 这一行的3个标签仍然并排显示，保持紧凑
                    ]),
            ])
            // [核心修改] 强制整个表单为单列布局，实现垂直排列
            ->columns(1);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('icon')
                    ->label('Icon'),
                Tables\Columns\TextColumn::make('value')
                    ->searchable(),
                Tables\Columns\TextColumn::make('label_en')
                    ->label('Label (EN)')
                    ->searchable(),
                Tables\Columns\TextColumn::make('label_zh')
                    ->label('Label (ZH)')
                    ->searchable(),
                Tables\Columns\TextColumn::make('label_ms')
                    ->label('Label (MS)')
                    ->searchable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
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
            'index' => Pages\ListAchievements::route('/'),
            'create' => Pages\CreateAchievement::route('/create'),
            'edit' => Pages\EditAchievement::route('/{record}/edit'),
        ];
    }
}
