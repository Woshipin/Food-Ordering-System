<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactFaqResource\Pages;
use App\Filament\Resources\ContactFaqResource\RelationManagers;
use App\Models\ContactFaq;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ContactFaqResource extends Resource
{
    protected static ?string $model = ContactFaq::class;

    protected static ?string $navigationIcon = 'heroicon-o-question-mark-circle';

    protected static ?string $navigationGroup = 'Contact Management System';

    protected static ?int $navigationSort = 8;

    // 定义一个方法，用于在导航菜单旁显示一个徽章（Badge），通常是记录总数
    public static function getNavigationBadge(): ?string
    {
        // 返回Contact Faq模型的总记录数作为徽章内容
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
                Forms\Components\Section::make('Frequently Asked Question')
                    ->schema([
                        Forms\Components\Section::make('Question')
                            ->schema([
                                Forms\Components\Grid::make(3)->schema([
                                    Forms\Components\TextInput::make('question_en')->label('Question (EN)'),
                                    Forms\Components\TextInput::make('question_zh')->label('Question (ZH)'),
                                    Forms\Components\TextInput::make('question_ms')->label('Question (MS)'),
                                ]),
                            ])->collapsible(),
                        Forms\Components\Section::make('Answer')
                            ->schema([
                                Forms\Components\Grid::make(3)->schema([
                                    Forms\Components\Textarea::make('answer_en')->label('Answer (EN)'),
                                    Forms\Components\Textarea::make('answer_zh')->label('Answer (ZH)'),
                                    Forms\Components\Textarea::make('answer_ms')->label('Answer (MS)'),
                                ]),
                            ])->collapsible(),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('question_en'),
                Tables\Columns\TextColumn::make('answer_en'),
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
            'index' => Pages\ListContactFaqs::route('/'),
            'create' => Pages\CreateContactFaq::route('/create'),
            'edit' => Pages\EditContactFaq::route('/{record}/edit'),
        ];
    }
}
