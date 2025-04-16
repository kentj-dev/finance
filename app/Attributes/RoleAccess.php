<?php

namespace App\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_METHOD)]
class RoleAccess
{
    public function __construct(public string $moduleName)
    {
    }
}
