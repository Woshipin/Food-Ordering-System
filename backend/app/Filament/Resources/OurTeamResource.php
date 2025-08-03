<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OurTeamResource\Pages;
use App\Filament\Resources\OurTeamResource\RelationManagers;
use App\Models\OurTeam;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
// 新增引入的类
use Filament\Forms\Components\Section;

class OurTeamResource extends Resource
{
    protected static ?string $model = OurTeam::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationGroup = 'About Us CMS Management';

    // [优化] 遵循Filament最佳实践，使用单数形式，Filament会自动处理复数
    protected static ?string $label = 'Team Member';

    protected static ?int $navigationSort = 3;

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
                // [核心修改] 添加一个大的外层Section，将所有表单项包裹起来
                Section::make('Team Member Details')
                    ->description('Fill in the details for the new team member.')
                    ->schema([
                        Forms\Components\FileUpload::make('image')
                            ->image()
                            ->label('Image')
                            ->required(),

                        Forms\Components\TextInput::make('name')
                            ->label('Name')
                            ->required(),

                        // [优化] 使用 "小Section" 将职位相关的多语言字段分组
                        Section::make('Position')
                            ->schema([
                                Forms\Components\TextInput::make('position_en')->label('Position (EN)')->required(),
                                Forms\Components\TextInput::make('position_zh')->label('Position (ZH)')->required(),
                                Forms\Components\TextInput::make('position_ms')->label('Position (MS)')->required(),
                            ])
                            ->columns(3), // 职位输入框在一行内显示，更紧凑

                        // [优化] 使用另一个 "小Section" 将描述相关的多语言字段分组
                        Section::make('Description')
                            ->schema([
                                Forms\Components\Textarea::make('description_en')->label('Description (EN)')->rows(4),
                                Forms\Components\Textarea::make('description_zh')->label('Description (ZH)')->rows(4),
                                Forms\Components\Textarea::make('description_ms')->label('Description (MS)')->rows(4),
                            ]),
                    ]),
            ])
            // [核心修改] 强制整个表单为单列布局，实现所有Section和字段垂直排列
            ->columns(1);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                // [优化] 将图片放在第一列，更直观
                Tables\Columns\ImageColumn::make('image')
                    ->circular(), // 使用圆形图片，更适合头像

                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('position_en')
                    ->label('Position (EN)')
                    ->searchable(),

                // 默认隐藏其他语言的职位，保持表格简洁，但可以手动开启查看
                Tables\Columns\TextColumn::make('position_zh')
                    ->label('Position (ZH)')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('position_ms')
                    ->label('Position (MS)')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),

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
            'index' => Pages\ListOurTeams::route('/'),
            'create' => Pages\CreateOurTeam::route('/create'),
            'edit' => Pages\EditOurTeam::route('/{record}/edit'),
        ];
    }
}
