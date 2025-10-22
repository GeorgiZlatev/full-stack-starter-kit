<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_tool_role', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_tool_id')->constrained()->onDelete('cascade');
            $table->string('role'); // 'owner', 'backend', 'frontend', 'pm', 'qa', 'designer'
            $table->timestamps();
            
            $table->unique(['ai_tool_id', 'role']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_tool_role');
    }
};
